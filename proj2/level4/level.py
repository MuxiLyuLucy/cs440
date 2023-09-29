# export FLASK_APP=level
from flask import Flask, render_template, request
import re

app = Flask(__name__)
 
@app.route("/")
def index():
    # check timer request
    if (request.args.get('timer')):
        # get timer value from request
        if (request.args.get('timer').isdigit()):
            time = int(request.args.get('timer'))
            if (time > 0):
              return render_template("timer.html", timer=str(time))
        return render_template("timer.html", timer="-1")       
    return render_template("index.html")

if __name__ == "__main__":
  app.run()