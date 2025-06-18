# JamDung Jobs – Staging VPC
resource "aws_vpc" "staging" {
  cidr_block           = "10.30.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "jamdung-staging-vpc"
    Env  = "staging"
  }
}

resource "aws_subnet" "staging_public_a" {
  vpc_id                  = aws_vpc.staging.id
  cidr_block              = "10.30.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = {
    Name = "jamdung-staging-public-a"
    Env  = "staging"
  }
}

resource "aws_internet_gateway" "staging" {
  vpc_id = aws_vpc.staging.id
  tags   = { Name = "jamdung-staging-igw" }
}

resource "aws_route_table" "staging_public" {
  vpc_id = aws_vpc.staging.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.staging.id
  }
}

resource "aws_route_table_association" "staging_public_a" {
  subnet_id      = aws_subnet.staging_public_a.id
  route_table_id = aws_route_table.staging_public.id
}


