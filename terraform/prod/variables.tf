variable "aws_region" {
  description = "AWS region for the S3 bucket."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name used for tags and default resource names."
  type        = string
  default     = "brixlift"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "prod"
}

variable "site_bucket_name" {
  description = "S3 bucket name for the Admin CRM build artifacts. Leave empty to use the default."
  type        = string
  default     = ""
}

variable "aliases" {
  description = "Comma-separated CloudFront alternate domain names, for example crm.example.com."
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN in us-east-1 for CloudFront aliases. Leave empty to use the default CloudFront domain."
  type        = string
  default     = ""
}

variable "hosted_zone_name" {
  description = "Route 53 hosted zone name."
  type        = string
  default     = "brixlift.com"
}

variable "domain_name" {
  description = "Primary custom domain for this site. Leave empty to skip Route 53 and ACM."
  type        = string
  default     = ""
}
