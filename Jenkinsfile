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
          // Convert path safely
          bat "\"${env.WSL_EXE}\" wslpath -a \"%WORKSPACE%\" > wslloc.txt"
          def wsLinux = readFile('wslloc.txt').trim()
          echo "WSL workspace: ${wsLinux}"
          echo "Commit: ${env.GIT_COMMIT}"

          // Build command as a single line (no backslashes or escapes)
          def wslCmd = "cd '${wsLinux}' && ANSIBLE_NOCOWS=1 ansible-playbook -i 'localhost,' -c local ansible/deploy.yml --extra-vars \\\"app_name=${env.APP_NAME} repo_url=${env.REPO_URL} git_version=${env.GIT_COMMIT}\\\""

          // Run it through WSL safely
          bat "\"${env.WSL_EXE}\" bash -lc \"${wslCmd}\""
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
