[![Syntax Check](https://github.com/madisonbook/CSC510/actions/workflows/syntax-check.yml/badge.svg?branch=alicebadges)](https://github.com/madisonbook/CSC510/actions/workflows/syntax-check.yml)

[![Code Coverage](https://codecov.io/gh/madisonbook/CSC510/branch/main/graph/badge.svg)](https://codecov.io/gh/madisonbook/CSC510)

[![Run Tests](https://github.com/madisonbook/CSC510/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/madisonbook/CSC510/actions/workflows/backend-tests.yml)

![Code Format](https://github.com/madisonbook/CSC510/actions/workflows/format.yml/badge.svg)

[![DOI](https://zenodo.org/badge/1044463210.svg)](https://doi.org/10.5281/zenodo.17546496)

# TASTE BUDDIEZ (Group 26)

## Our Story

* **Tired of eating the same meal for a week straight?**
* **Want to take your home cooking to the next level?**
* **Craving some authentic local cuisine?**

At Taste Buddiez, we believe food is more than just fuel — it’s a connection. Our mission is to bring neighbors together through the flavors they create and love. Whether you’re a busy professional craving home-cooked variety, a local chef eager to share your craft, or a foodie seeking authentic dishes from your own community, Taste Buddiez makes it simple to buy, sell, and swap homemade meals right in your neighborhood.

## Our Product

### Taste Buddies is a neighborhood meal-sharing platform that allows users to:
* List homemade meals for sale or swap
* Discover meals from local home cooks
* Build community through food sharing
* Review and rate meals

### Technology Stack:
* Backend: FastAPI (Python)
* Database: MongoDB
* Frontend: React (Port 5173)
* Containerization: Docker & Docker Compose

## Quick Start Guide

#### Clone the Repository

####Make Virtual Environment
cd to proj3/backend

//create new virtual environment with the name .venv

//activate the virtual environment

####Install Dependencies
//install dependencies from requirement.txt file

pip install -r requirements.txt

####run backend

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

####For frontend

cd to frontend

npm install

npm run dev

create .env in backend folder and replace with below:

MONGODB_URL="mongodb+srv://yashbmv_db_user:Ecobites1234@cluster0.x6pmmrs.mongodb.net/?appName=Cluster0"
DATABASE_NAME=tastebuddies

#JWT Configuration

SECRET_KEY=your-secret-key-here-change-in-production

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30


