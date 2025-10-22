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
          env.GIT_COMMIT = bat(returnStdout: true, script: 'git rev-parse HEAD').trim()
          echo "GIT_COMMIT = ${env.GIT_COMMIT}"
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
          // Convert workspace path safely
          bat """
"%WINDIR%\\System32\\wsl.exe" wslpath -a "%WORKSPACE%" > wslloc.txt
"""
          def wsLinux = readFile('wslloc.txt').trim()
          echo "WSL workspace = ${wsLinux}"
          echo "Commit = ${env.GIT_COMMIT}"

          // Single WSL call — clean and stable
          bat """
"%WINDIR%\\System32\\wsl.exe" bash -lc "cd '${wsLinux}' && \
ANSIBLE_NOCOWS=1 ansible-playbook -i 'localhost,' -c local ansible/deploy.yml \
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
