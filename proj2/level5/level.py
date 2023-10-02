# export FLASK_APP=level
from flask import Flask, render_template, request

app = Flask(__name__)
 
def welcome():
    return render_template("welcome.html")

def signup():
    next_url = request.args.get('next')
    if next_url != "confirm":
        return render_template("signup.html", next="confirm")
    return render_template("signup.html", next=request.args.get('next'))

def confirm():
    next_url = request.args.get('next')
    if next_url != "welcome":
        return render_template("confirm.html", next="welcome")
    return render_template("confirm.html", next=request.args.get('next'))

@app.route("/")
def index():
    return welcome()

@app.route("/<path:path>")
def catch_all(path):
    if path == "signup":
        return signup()
    elif path == "confirm":
        return confirm()
    else:
        return welcome()


if __name__ == "__main__":
  app.run()