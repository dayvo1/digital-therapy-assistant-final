variable "key_pair_name" {
  description = "The name of the SSH key pair to use for the EC2 instance"
  type        = string
  default     = "digital-therapy-key"
}

variable "anthropic_api_key" {
  description = "The API key used by the digital therapy assistant backend"
  type        = string
  sensitive   = true # This hides the key from being printed in logs
}