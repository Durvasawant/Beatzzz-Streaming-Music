pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    stages {
        stage('Verify Tools') {
            steps {
                sh '''
                    export PATH="/opt/homebrew/opt/node@24/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

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