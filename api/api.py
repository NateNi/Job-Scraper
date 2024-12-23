from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/website', methods=['POST'])
def create_website():
    data = request.get_json()
    print('Received data:', data)
    return jsonify({'message': 'Data received successfully'})

if __name__ == '__main__':
    app.run(debug=True)