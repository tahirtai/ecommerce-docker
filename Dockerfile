# ---------- FRONTEND BUILD ----------
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY frontrestapi/package*.json ./
RUN npm ci
COPY frontrestapi/ .
RUN npm run build -- --configuration=production

# ---------- BACKEND ----------
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# backend deps
COPY ecommerce/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# backend code
COPY ecommerce/ .

# frontend build
COPY --from=frontend-builder /frontend/dist/frontrestapi /usr/share/nginx/html

# nginx config
COPY frontrestapi/nginx.conf /etc/nginx/conf.d/default.conf

# collect static
RUN python manage.py collectstatic --noinput

EXPOSE 80

CMD service nginx start && gunicorn ecommerce.wsgi:application --bind 0.0.0.0:8000
