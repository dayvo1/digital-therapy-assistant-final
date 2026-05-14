terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

}

provider "aws" {
  region = "us-east-1"
}

# 1. The Firewall (Security Group)
resource "aws_security_group" "app_sg" {
  name        = "therapy-app-sg"
  description = "Allow SSH and App Traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow SSH from anywhere
  }

  ingress {
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow App access
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Allow server to talk to internet
  }
}

# 2. The Server (EC2)
resource "aws_instance" "app_server" {
  ami           = "ami-0bb8438f03f339027" # Amazon Linux 2023 in us-east-1
  instance_type = "t2.micro"             # Free tier eligible

  # This must match the 'key_pair_name' in your YAML
  key_name      = "E90"

  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y docker
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ec2-user
              # Create directory for your app
              mkdir -p /opt/commission-calc
              EOF

  tags = {
    Name = "DigitalTherapyAssistant"
  }
}

# 3. Output for GitHub Actions
output "public_ip" {
  value = aws_instance.app_server.public_ip
}