pipeline {
  agent any
  options { skipDefaultCheckout(true); timestamps() }

  environment {
    APP_NAME = 'eventapp'
    REPO_URL = 'https://github.com/vasusunkireddy/event-driven.git'
    WSL_EXE  = 'C:\\Windows\\System32\\wsl.exe'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          // Get raw output (CMD prints the command too). Keep only the last line (the SHA).
          def raw = bat(returnStdout: true, script: 'git rev-parse HEAD').trim()
          def lines = raw.readLines().findAll { it?.trim() }
          env.GIT_COMMIT = lines[-1].trim()
          echo "Checked out commit: ${env.GIT_COMMIT}"
        }
      }
    }

    stage('Build (Windows)') {
      steps {
        dir('app') {
          bat 'node -v'
          bat 'npm -v'
          bat 'npm ci || npm install'
        }
      }
    }

    stage('Deploy via Ansible (WSL)') {
      steps {
        script {
          // Convert WORKSPACE to Linux path safely (write/read file to avoid nested quoting)
          bat "\"${env.WSL_EXE}\" wslpath -a \"%WORKSPACE%\" > wslloc.txt"
          def wsLinux = readFile('wslloc.txt').trim()

          echo "WSL workspace: ${wsLinux}"
          echo "Commit: ${env.GIT_COMMIT}"

          // Single WSL call. Ansible runs on localhost; no hosts.ini needed.
          bat """
\"${env.WSL_EXE}\" bash -lc "cd '${wsLinux}' && \\
ANSIBLE_NOCOWS=1 ansible-playbook -i 'localhost,' -c local ansible/deploy.yml \\
--extra-vars 'app_name=${env.APP_NAME} repo_url=${env.REPO_URL} git_version=${env.GIT_COMMIT}'"
"""
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'ansible/**/*.yml, app/**/package*.json',
                        allowEmptyArchive: true,
                        onlyIfSuccessful: false
      cleanWs deleteDirs: true, notFailBuild: true
    }
  }
}
