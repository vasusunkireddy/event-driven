pipeline {
  agent any

  environment {
    APP_NAME = "eventapp"
    REPO_URL = "https://github.com/vasusunkireddy/event-driven.git"
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

          // Symlink playbooks into WSL home with stable paths
          bat """
wsl bash -lc "ln -sf \$(wslpath -a '%WORKSPACE%')/ansible/hosts.ini ~/event-hosts.ini && ln -sf \$(wslpath -a '%WORKSPACE%')/ansible/deploy.yml ~/deploy.yml"
wsl bash -lc "ANSIBLE_NOCOWS=1 ansible-playbook -i ~/event-hosts.ini ~/deploy.yml --extra-vars 'app_name=${APP_NAME} repo_url=${REPO_URL} git_version=${commit}'"
"""
        }
      }
    }
  }
}
