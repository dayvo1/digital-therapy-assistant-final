# EC2 Deployment Guide

## Prerequisites
- AWS account
- GitHub repository with the project code
- Anthropic API key

---

## 1. Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Configure:
   - **Name**: `digital-therapy`
   - **AMI**: Ubuntu Server 24.04 LTS
   - **Instance type**: `t2.medium`
3. Create a new key pair (RSA, .pem format) and download it
4. Under **Network settings**, add inbound rules:
   - SSH (port 22) — your IP
   - Custom TCP (port 3000) — 0.0.0.0/0
   - Custom TCP (port 8080) — 0.0.0.0/0
5. Click **Launch Instance**

---

## 2. Allocate and Associate Elastic IP

1. Go to EC2 → Elastic IPs → Allocate Elastic IP address
2. Select the new Elastic IP → Actions → Associate Elastic IP address
3. Select your instance and click Associate

---

## 3. SSH Into the Instance

Fix key permissions and connect:

```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@<elastic-ip>
```

---

## 4. Install Docker

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
exit
```

SSH back in after exiting for the group change to take effect.

---

## 5. Clone the Repository

```bash
git clone https://github.com/dayvo1/digital-therapy-assistant-final.git
cd digital-therapy-assistant-final
```

---

## 6. Configure Environment Variables

Edit the `docker-compose.yml` to set your API key and JWT secret:

```bash
nano docker-compose.yml
```

Set the following values under the backend environment section:
```
- ANTHROPIC_API_KEY=your-anthropic-api-key
- JWT_SECRET=your-256-bit-secret-key
```

Save with `Ctrl+X`, `Y`, `Enter`.

---

## 7. Create Data Directories

```bash
mkdir -p data/vectors
chmod -R 777 data
```

---

## 8. Enable H2 Remote Access

```bash
echo "spring.h2.console.settings.web-allow-others=true" >> src/main/resources/application.properties
```

---

## 9. Start the Application

```bash
docker-compose up -d --build
```

This will build and start both containers. The backend takes ~3-5 minutes to compile and start.

Monitor progress:

```bash
docker-compose logs -f backend
```

---

## 10. Verify Deployment

Once running, verify the following URLs are accessible:

| URL | Expected |
|-----|----------|
| `http://<elastic-ip>:3000` | Frontend home page |
| `http://<elastic-ip>:8080/swagger-ui/index.html` | Swagger API docs |
| `http://<elastic-ip>:8080/h2-console` | H2 database console |
| `http://<elastic-ip>:8080/actuator/health` | `{"status":"UP"}` |

---

## Troubleshooting

- **Out of disk space**: Run `docker system prune -a` to clear build cache
- **Backend unhealthy**: Check logs with `docker logs digital-therapy-assistant-final_backend_1`
- **SSH timeout**: Check your security group — your IP may have changed, update the SSH inbound rule
