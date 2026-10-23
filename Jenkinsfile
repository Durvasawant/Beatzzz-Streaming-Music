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
                        trap 'rm -f "$RESPONSE_FILE"; unset TOKEN' EXIT

                        echo "Requesting Airflow API token..."

                        TOKEN_HTTP=$(AF_USER="$AF_USER" AF_PASS="$AF_PASS" python3 -c '
import json, os
print(json.dumps({
    "username": os.environ["AF_USER"],
    "password": os.environ["AF_PASS"]
}))
' | curl -sS 
                            -o "$RESPONSE_FILE" 
                            -w "%{http_code}" 
                            -X POST "$AIRFLOW_URL/auth/token" 
                            -H "Content-Type: application/json" 
                            -d @-)

                        if [ "$TOKEN_HTTP" != "200" ]; then
                            echo "ERROR: Airflow token endpoint returned HTTP $TOKEN_HTTP"
                            echo "Response body:"
                            cat "$RESPONSE_FILE"
                            exit 1
                        fi

                        TOKEN=$(python3 -c '
import json, sys
print(json.load(open(sys.argv[1])).get("access_token", ""))
' "$RESPONSE_FILE")

                        if [ -z "$TOKEN" ]; then
                            echo "ERROR: Airflow did not return an API token."
                            exit 1
                        fi

                        echo "Airflow API authentication succeeded."
                        echo "Triggering Airflow DAG: $DAG_ID"

                        RUN_HTTP=$(curl -sS \
                            -o "$RESPONSE_FILE" \
                            -w "%{http_code}" \
                            -X POST \
                            "$AIRFLOW_URL/api/v2/dags/$DAG_ID/dagRuns" \
                            -H "Authorization: Bearer $TOKEN" \
                            -H "Content-Type: application/json" \
                            -d '{"logical_date":null,"conf":{},"note":"Triggered by Jenkins CI"}')

                        if [ "$RUN_HTTP" != "200" ] && [ "$RUN_HTTP" != "201" ]; then
                            echo "ERROR: Airflow DAG trigger returned HTTP $RUN_HTTP"
                            echo "Response body:"
                            cat "$RESPONSE_FILE"
                            exit 1
                        fi

                        RUN_ID=$(python3 -c '
import json, sys
print(json.load(open(sys.argv[1])).get("dag_run_id", ""))
' "$RESPONSE_FILE")

                        if [ -z "$RUN_ID" ]; then
                            echo "ERROR: Airflow did not return a DAG run ID."
                            exit 1
                        fi

                        echo "Airflow DAG run created successfully."
                        echo "DAG ID: $DAG_ID"
                        echo "Run ID: $RUN_ID"
                        echo "Monitor the run at $AIRFLOW_URL"
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
            echo 'Beatzzz CI checks completed with warnings or lint issues; Airflow was triggered.'
        }
        failure {
            echo 'Beatzzz CI or Airflow trigger failed. Check the stage logs.'
        }
    }
}