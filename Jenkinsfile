pipeline {
  agent any

  environment {
    APP_NAME = "eventapp"
    REPO_URL = "https://github.com/vasusunkireddy/event-driven.git"
    WSL_EXE  = "C:\\Windows\\System32\\wsl.exe"
  }

  stages {
    stage("Checkout") {
      steps { checkout scm }
    }

    stage("Build (Windows)") {
      steps {
        dir("app") {
          bat "node -v"
          bat "npm -v"
          bat "npm ci || npm install"
        }
      }
    }

    stage("Deploy via Ansible (WSL)") {
      steps {
        script {
          // current commit SHA
          def commit = bat(returnStdout: true, script: "git rev-parse HEAD").trim()
          // convert Jenkins workspace to Linux path once
          def wsLinux = bat(returnStdout: true, script: "${env.WSL_EXE} wslpath -a \"%WORKSPACE%\"").trim()

          // run ansible-playbook from WSL using Linux paths
          bat """
${env.WSL_EXE} bash -lc "ANSIBLE_NOCOWS=1 ansible-playbook -i '${wsLinux}/ansible/hosts.ini' '${wsLinux}/ansible/deploy.yml' --extra-vars 'app_name=${APP_NAME} repo_url=${REPO_URL} git_version=${commit}'"
"""
        }
      }
    }
  }
}
