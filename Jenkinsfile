pipeline() {
    agent any
    environment {
        AWS_PROFILE = "233analytics"
    }
    stages{
        stage("Checkout"){
            steps {
                checkout scm
            }
        }
        stage("Install"){
            steps{
                nodejs(nodeJSInstallationName: 'Node12'){
                    sh 'npm install'
                }
            }
        }
        stage("Build"){
            steps{
                nodejs(nodeJSInstallationName: 'Node12'){
                    sh 'npm run build'
                }
            }
        }
        stage('Copy to S3'){
            steps{
                sh '/usr/local/bin/aws s3 sync static/ s3://mathnet-dev/'
            }
        }
    }
}
