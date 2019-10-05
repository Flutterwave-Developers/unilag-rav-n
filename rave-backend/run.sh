export FN_AUTH_REDIRECT_URI=http://localhost:8080
export FN_BASE_URI=http://0.0.0.0:8080/

export FLASK_APP=app.py
export FLASK_DEBUG=1
export FN_FLASK_SECRET_KEY=SOMETHING RANDOM AND SECRET

python -m flask run --host 0.0.0.0   -p 8080