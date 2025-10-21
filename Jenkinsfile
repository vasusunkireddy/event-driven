pipeline {
  agent any
  options { skipDefaultCheckout(true); timestamps() }

  environment {
    APP_NAME = 'eventapp'
    REPO_URL = 'https://github.com/vasusunkireddy/event-driven.git'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script { echo "GIT_COMMIT = ${env.GIT_COMMIT}" }
      }
    }

    stage('Build (Windows)') {
      steps {
        dir('app') {
          bat 'node -v'
          bat 'npm -v'
          // prefer clean install; fallback to install if no lockfile
          bat 'npm ci || npm install'
        }
      }
    }

    // --- WSL deploy via pure CMD/BAT, safe quoting & path handling ---
    stage('Deploy via Ansible (WSL)') {
      steps {
        bat '''
        @echo off
        setlocal enabledelayedexpansion

        rem 1) Convert Windows %WORKSPACE% -> WSL path (/mnt/c/...)
        for /f "delims=" %%W in ('%WINDIR%\\System32\\wsl.exe wslpath -a "%WORKSPACE%"') do set "WSL_WORK=%%W"

        if not defined WSL_WORK (
          echo [ERROR] Failed to convert WORKSPACE to WSL path
          exit /b 1
        )

        echo WSL workspace: %WSL_WORK%
        echo Commit: %GIT_COMMIT%

        rem 2) Build extra-vars as one flat string (no nested commands)
        set "EXTRA_VARS=app_name=%APP_NAME% repo_url=%REPO_URL% git_version=%GIT_COMMIT%"

        rem 3) Run ansible-playbook inside WSL; use relative paths after cd
        "%WINDIR%\\System32\\wsl.exe" bash -lc "cd \"%WSL_WORK%\" && ANSIBLE_NOCOWS=1 ansible-playbook ansible/deploy.yml --extra-vars '%EXTRA_VARS%' -vvv"

        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'ansible/**/*.yml, ansible/**/*.ini, app/**/package*.json',
                        allowEmptyArchive: true,
                        onlyIfSuccessful: false
      cleanWs deleteDirs: true, notFailBuild: true
    }
  }
}
