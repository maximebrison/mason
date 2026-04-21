FROM node:latest AS frontend-builder
WORKDIR /frontend
COPY frontend/ .
RUN npm install && npm run build

FROM python:3.14-slim
RUN apt-get update && apt-get install -y \
	gcc \
	cron \
	build-essential \
	&& apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ .
COPY --from=frontend-builder /frontend/dist ./site

CMD ["python", "app.py"]
