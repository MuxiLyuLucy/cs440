# export FLASK_APP=level
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    # check timer request
    if (request.args.get('query')):
        return render_template("search.html", query=request.args.get('query'))
    return render_template("index.html")

if __name__ == "__main__":
  app.run()