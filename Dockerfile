FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# backend deps
COPY ecommerce/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# backend code
COPY ecommerce/ .

EXPOSE 8000

CMD gunicorn ecommerce.wsgi:application --bind 0.0.0.0:8000
