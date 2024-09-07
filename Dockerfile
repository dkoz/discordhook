FROM python:3.11-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

ENV NAME World

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]
