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
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                    set -eu
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
                    set -eu
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
                    sh '''
                        echo "Running frontend lint..."
                        if npm run lint; then
                            echo "Frontend lint passed."
                        else
                            echo "WARNING: Frontend lint issues found. Continuing pipeline."
                        fi
                    '''
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
                        set -eu
                        node --check src/index.js
                        echo "Backend syntax check passed."
                    '''
                }
            }
        }

        stage('Trigger Airflow Pipeline') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'airflow-api-credentials',
                    usernameVariable: 'AF_USER',
                    passwordVariable: 'AF_PASS'
                )]) {
                    sh '''
                        set +x
                        set -eu

                        AIRFLOW_URL="http://localhost:8081"
                        DAG_ID="beatzzz_spotify_pipeline"

                        RESPONSE_FILE=$(mktemp)
                        REQUEST_FILE=$(mktemp)
                        TOKEN=""

                        trap 'rm -f "$RESPONSE_FILE" "$REQUEST_FILE"; unset TOKEN AF_PASS' EXIT

                        echo "Preparing Airflow authentication request..."

                        export AF_USER AF_PASS REQUEST_FILE

                        python3 -c '
import json
import os

with open(os.environ["REQUEST_FILE"], "w") as f:
    json.dump({
        "username": os.environ["AF_USER"],
        "password": os.environ["AF_PASS"]
    }, f)
'

                        echo "Requesting Airflow API token..."

                        TOKEN_HTTP=$(curl -sS \
                            -o "$RESPONSE_FILE" \
                            -w "%{http_code}" \
                            -X POST \
                            "$AIRFLOW_URL/auth/token" \
                            -H "Content-Type: application/json" \
                            --data-binary "@$REQUEST_FILE")

                        unset AF_PASS
                        rm -f "$REQUEST_FILE"

                        if [ "$TOKEN_HTTP" != "200" ] && [ "$TOKEN_HTTP" != "201" ]; then
                            echo "ERROR: Airflow token request returned HTTP $TOKEN_HTTP."
                            echo "Response body suppressed to protect credentials."
                            exit 1
                        fi

                        TOKEN=$(python3 -c '
import json
import sys

with open(sys.argv[1]) as f:
    print(json.load(f).get("access_token", ""))
' "$RESPONSE_FILE")

                        if [ -z "$TOKEN" ]; then
                            echo "ERROR: Airflow returned no access token."
                            exit 1
                        fi

                        echo "Airflow authentication successful."
                        echo "Checking DAG access..."

                        DAG_HTTP=$(curl -sS \
                            -o "$RESPONSE_FILE" \
                            -w "%{http_code}" \
                            -H "Authorization: Bearer $TOKEN" \
                            "$AIRFLOW_URL/api/v2/dags/$DAG_ID")

                        if [ "$DAG_HTTP" != "200" ]; then
                            echo "ERROR: DAG access returned HTTP $DAG_HTTP."
                            echo "Response body suppressed."
                            exit 1
                        fi

                        echo "Airflow DAG verified: $DAG_ID"
                        echo "Triggering Airflow DAG..."

                        RUN_HTTP=$(curl -sS \
                            -o "$RESPONSE_FILE" \
                            -w "%{http_code}" \
                            -X POST \
                            "$AIRFLOW_URL/api/v2/dags/$DAG_ID/dagRuns" \
                            -H "Authorization: Bearer $TOKEN" \
                            -H "Content-Type: application/json" \
                            -d '{"logical_date":null,"conf":{},"note":"Triggered by Jenkins CI"}')

                        if [ "$RUN_HTTP" != "200" ] && [ "$RUN_HTTP" != "201" ]; then
                            echo "ERROR: DAG trigger returned HTTP $RUN_HTTP."
                            echo "Response body suppressed."
                            exit 1
                        fi

                        RUN_ID=$(python3 -c '
import json
import sys

with open(sys.argv[1]) as f:
    print(json.load(f).get("dag_run_id", ""))
' "$RESPONSE_FILE")

                        if [ -z "$RUN_ID" ]; then
                            echo "ERROR: Airflow returned no DAG run ID."
                            exit 1
                        fi

                        echo "Airflow DAG run created successfully."
                        echo "DAG ID: $DAG_ID"
                        echo "Run ID: $RUN_ID"
                        echo "Airflow URL: $AIRFLOW_URL"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Beatzzz CI checks and Airflow trigger completed successfully.'
        }

        unstable {
            echo 'Beatzzz pipeline completed with warnings or lint issues.'
        }

        failure {
            echo 'Beatzzz CI or Airflow trigger failed. Check the stage logs.'
        }

        always {
            echo 'Beatzzz pipeline execution finished.'
        }
    }
}