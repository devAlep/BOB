import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from flask import Flask, request, jsonify

# Load the data
data = pd.read_csv('tornado.csv')

# Preprocess the data
data = data[['slat', 'slon', 'mag']]
data = data.dropna()
data['mag'] = np.where(data['mag'] > 0, 1, 0)

# Split the data into features and target
X = data.drop('mag', axis=1)
y = data['mag']

# Train the model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print('Accuracy:', accuracy_score(y_test, y_pred))

# Create the Flask app
app = Flask(__name__)

# Create the route
@app.route('/predict', methods=['GET'])
def predict_storm():
    # Get the location name or coordinates from the request
    location = request.args.get('location')
    
    # Use Geopy to get the latitude and longitude from the location name
    try:
        geolocator = Nominatim(user_agent='my_app')
        location = geolocator.geocode(location, timeout=10)
        lat, lon = location.latitude, location.longitude
    except (AttributeError, GeocoderTimedOut):
        return jsonify({'error': 'Could not get latitude and longitude for the location'})
    
    # Make a prediction using the trained model
    prediction_proba = model.predict_proba([[lat, lon]])
    
    # Return the prediction as a JSON object
    if prediction_proba[0][0] > 0.8:
        prediction = 'Severe'
    elif prediction_proba[0][0] > 0.6:
        prediction = 'High'
    elif prediction_proba[0][0] > 0.4:
        prediction = 'Moderate'
    elif prediction_proba[0][0] > 0.2:
        prediction = 'Low'
    else:
        prediction = 'No'
    response  = jsonify({'prediction' : prediction})
    # Enable Access-Control-Allow-Origin
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == '__main__':
    app.run(debug=True)