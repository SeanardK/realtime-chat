pipeline {
  agent any

  stages {
    stage('Prepare .env') {
      steps {
        withCredentials([file(credentialsId: 'realtime-chat-env', variable: 'ENV_FILE')]) {
          sh 'rm -f .env && cp $ENV_FILE .env'
        }
      }
    }

    stage('Build Images') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up -d --remove-orphans --no-deps backend frontend'
      }
    }
  }

  post {
    success { echo 'Pipeline completed successfully.' }
    failure { echo 'Pipeline failed.' }
  }
}
