## Self-Hosted Runner Setup

### 1. Create an EC2 Server

Follow the steps below to set up a self-hosted runner on an **EC2 instance**.

- The runner is created in the **SSPROD** account since we already have Salesforce registry connectivity.
- Once the EC2 instance is ready, **SSH** into it and execute the following commands.

**Note:** The runner setup commands should be taken directly from GitHub instead of copying from this document to ensure they are up to date.

## 2. Install the Self-Hosted Runner

```bash
# Create a folder
mkdir actions-runner && cd actions-runner

# Download the latest runner package
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz

# Optional: Validate the hash
echo "ba46ba7ce3a4d7236b16fbe44419fb453bc08f866b24f04d549ec89f1722a29e  actions-runner-linux-x64-2.321.0.tar.gz" | shasum -a 256 -c

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz

# Create the runner and start the configuration experience
./config.sh --url https://github.com/bt-public-cloud-emu --token YOUR_RUNNER_TOKEN

# Run the runner
./run.sh
```

### Make it run in the background
```bash
nohup ./run.sh > output.log 2>&1 &
```
⚠️ **Important:**### Make the runner to run in systemd service if the systme will reboot then automatically it will start.
#### 3. Configure GitHub Actions Runner as a Systemd Service

> **Note**: To ensure the GitHub Actions self-hosted runner starts automatically on EC2 reboot, follow the steps below.

#### 3.1: Create a Systemd Unit File

Run:
```bash
sudo vi /etc/systemd/system/github-runner.service
```
```
[Unit]
Description=GitHub Actions Runner
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=m.mahapatra.su
ExecStart=/bin/bash /home/m.mahapatra/actions-runner/run.sh

[Install]
WantedBy=multi-user.target
```
📝 Note: Make sure the ExecStart path matches the actual location of your run.sh script.

- Step3.2: Reload and Enable the Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable github-runner.service
sudo systemctl restart github-runner.service
sudo systemctl status github-runner.service
```
### Post Configuration Steps
After setting up the runner, install necessary dependencies to support pipelines globally.

```bash
#Install `jq` and `yq`
sudo curl -L -o /usr/local/bin/jq https://github.com/jqlang/jq/releases/latest/download/jq-linux-amd64
sudo chmod +x /usr/local/bin/jq
jq --version

sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/download/v4.45.1/yq_linux_amd64
sudo chmod +x /usr/local/bin/yq
yq --version

#Install Git
sudo dnf install git -y
git --version

#Install Docker
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

If using **RHEL 9**, use this instead:

sudo yum install -y docker-ce --allowerasing

# Start and Enable Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl status docker

# Add User to Docker Group
sudo usermod -aG docker $USER
# Check if Docker is installed:
docker image ls

If **permission denied** error occurs:

sudo chmod 666 /var/run/docker.sock
```

## 4. Verify the Runner Installation

1. Navigate to **GitHub Organization Directory**
2. Click **Settings** → **Actions** → **Runners**
3. Ensure the **Linux self-hosted runner** appears

## 5. Conclusion

Once all steps are executed successfully, your **self-hosted runner** should be visible on GitHub and ready to use.

## Workflow Trigger
This workflow is triggered by:
- **Workflow Call**: It is designed to be reusable and can be triggered by another workflow.

## Jobs

### 1. Detect Updates
**Purpose:**
- Detects changes in `docker-config*.yaml` files.
- Creates a matrix for processing updated configurations.

**Key Steps:**
- Checkout code.
- Identify changed Docker configuration files.
- Store the updated files as a JSON matrix for the next job.

### 2. Pipeline Processing
**Purpose:**
- Processes each updated Docker configuration file.
- Builds, scans, and pushes Docker images to AWS ECR.

**Key Steps:**
- Checkout code.
- Extracts details from the configuration file (ECR repo name, release tag, Dockerfile location, AWS account, and region).
- Maps the AWS account based on the environment.
- Validates the existence of the Dockerfile.
- Builds the Docker image.
- Scans the image for vulnerabilities using Trivy.
- Assumes the required AWS IAM role.

## Docker-config file input parameters
| Variable            | Description                                              | Requirement  |
|---------------------|----------------------------------------------------------|-------------|
| `ecr_repo_name`    | Name of the target ECR repository                         | Mandatory   |
| `release_tag`      | Tag assigned to the Docker image                          | Mandatory   |
| `dockerfile_location` | Path to the Dockerfile                                | Mandatory   |
| `account_name`     | AWS account environment (e.g., dev, qa, prod)             | Mandatory   |
| `region`          | AWS region                                                | Mandatory   |
| `skip_vulnerability` | User input - if they want to skip the vulnerability scan | Optional   |

skip_vulnerability:- This variable is optional; by default, it is set to false. The user can pass true if he want to bypass the vulnerability.

## Account Mapping
- We have separate account-map.yaml file which will have all the account details.
The script includes a predefined mapping of AWS account numbers for different environments:
```yaml
   infdev: "832066258344"
   infssdev: "145565074481"
   dev: "200102753645"
   qa: "571103364594"
   uat: "061095776052"
   ssdev: "460949649053"
   uipdev: "420142932382"
   uipqa: "534021139154"
   uipuat: "399759675692"
   prod: "444248507999"
   ssprod: "833608842610"
   uipprod: "552085469008"
   soxprod: "108720275529"
```

## Security Scanning
- **Trivy**: Scans images for vulnerabilities with `HIGH` and `CRITICAL` severity.
- **Docker Scout (Commented Out)**: Can be enabled for additional security checks.

## Role Assumption
The workflow assumes an AWS IAM role using `aws-actions/configure-aws-credentials@v4` before pushing images to ECR.

## Creation of IAM Role and OIDC Provider:

1. In each account we created IAM role and OIDC provider.
2. [Code Link](https://github.com/bt-public-cloud-emu/awf03-prj-pubcloud-ghact-tf-aws/blob/main/manifests/all-account-assume-role.yaml).
3. IAM role is required to push the image to ecr repositories. This role has access to ecr repos. We are assuming this role in our pipeline.
4. As per github actions documentation OIDC provider is mandatory if we want to assume the aws iam role in our pipeline so we have created the OIDC provider in all the accounts. This oidc provider arn is added into the Trust policy of above iam role.


## Usage
This workflow can be used by calling it from another workflow:
```yaml
jobs:
  build-and-push:
    uses: <owner>/<repo>/.github/workflows/docker-image-build-push-multifile.yaml@main
```

## Notes
- Ensure the required AWS IAM permissions are in place.
---
This workflow ensures an automated, secure, and efficient process for managing Docker image builds and deployments in AWS ECR.
