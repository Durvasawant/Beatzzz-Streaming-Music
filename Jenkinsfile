
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                    echo "Checking installed tools..."
                    git --version
                    node --version
                    npm --version
                    python3 --version
                '''
            }
        }

        stage('Check Project Structure') {
            steps {
                sh '''
                    test -d frontend
                    test -d backened
                    echo "Beatzzz frontend and backend folders found."
                '''
            }
        }
    }

    post {
        success {
            echo 'Beatzzz CI checks passed.'
        }
        failure {
            echo 'Beatzzz CI checks failed. Check the console output.'
        }
    }
}
