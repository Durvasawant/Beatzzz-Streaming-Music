
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    environment {
        PATH = "/opt/homebrew/opt/node@24/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    }

    stages {
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
                    test -f frontend/package-lock.json
                    test -f backened/package-lock.json
                    echo "Project structure verified."
                '''
            }
        }

        stage('Frontend Install') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Frontend Lint') {
            steps {
                dir('frontend') {
                    catchError(
                        buildResult: 'UNSTABLE',
                        stageResult: 'UNSTABLE'
                    ) {
                        sh 'npm run lint'
                    }
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Backend Install') {
            steps {
                dir('backened') {
                    sh 'npm ci'
                }
            }
        }

        stage('Backend Validation') {
            steps {
                dir('backened') {
                    sh '''
                        node --check src/index.js
                        echo "Backend syntax check passed."
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Beatzzz CI checks passed.'
        }
        unstable {
            echo 'Beatzzz CI checks completed with warnings or lint issues.'
        }
        failure {
            echo 'Beatzzz CI checks failed. Check the stage logs.'
        }
    }
}
