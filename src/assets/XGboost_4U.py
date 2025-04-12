#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.api as sm
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split


# In[2]:


df = pd.read_csv("Merged_1630_472.csv")


# In[3]:


duplicates = df[df.mjd.duplicated(keep=False)]
len(duplicates)


# In[4]:


df = df.drop_duplicates(subset=['mjd'])


# In[5]:


df = df[df['flux']>0]


# In[6]:


print(df.shape)
df.head()


# In[7]:


time = df['mjd']
flux = df['flux']


# In[8]:


lowess = sm.nonparametric.lowess(flux, time, frac=0.002)
loess_time, loess_flux = zip(*lowess)
plt.plot(loess_time, loess_flux, color='orange', label='LOESS')
plt.legend()
plt.show()


# In[9]:


time = loess_time
flux = loess_flux


# In[10]:


d = pd.DataFrame({'time':time, 'flux':flux})


# In[11]:


d['rolling_mean'] = d['flux'].rolling(window=2000).mean()
d['rolling_std'] = d['flux'].rolling(window=2000).std()
d = d.iloc[2000:].reset_index(drop=True)


# In[12]:


d.isna().sum()


# In[13]:


from sklearn.preprocessing import MinMaxScaler

scaler_1 = MinMaxScaler()
scaler_2 = MinMaxScaler()
scaler_3 = MinMaxScaler()
#scaler_4= MinMaxScaler()
scaler_5=MinMaxScaler()
d['flux'] = scaler_1.fit_transform(d[['flux']])
d['rolling_std'] = scaler_2.fit_transform(d[['rolling_std']])
d['rolling_mean'] = scaler_3.fit_transform(d[['rolling_mean']])
#d['expanding_sum_flux'] =scaler_4.fit_transform(d[['expanding_sum_flux']])
d['time'] = scaler_5.fit_transform(d[['time']])


# In[14]:


def create_sequences(data, input_size, output_size):
    if not isinstance(data, pd.DataFrame):
        raise TypeError("Input data must be a pandas DataFrame")

    data = data.values

    if len(data) < input_size + output_size:
        raise ValueError("Not enough data to create sequences.")

    X, y = [], []
    for i in range(len(data) - input_size - output_size + 1):
        X.append(data[i:i + input_size])  # Input sequence
        y.append(data[i + input_size:i + input_size + output_size, 1])

    return np.array(X), np.array(y)


# In[15]:


input_shape = 400
output_shape = 1


# In[16]:


X,y=create_sequences(d,input_shape,output_shape)
X.shape


# In[17]:


X[0][0][2]=0


# In[18]:


if np.isnan(X).any():
    print("X contains NaN values.")
else:
    print("X does not contain NaN values.")


# In[19]:


nan_indices = np.argwhere(np.isnan(X))
print("Indices of NaN values in X:", nan_indices)


# In[20]:


print(X.shape,y.shape)


# In[21]:


split_index = int(0.8*len(d))
X_train,X_test = X[:split_index+1],X[split_index+1:]
y_train,y_test = y[:split_index+1],y[split_index+1:]


# In[22]:


print(X_train.shape,X_test.shape,y_train.shape,y_test.shape)


# In[23]:


d.columns


# In[24]:


X_train = X_train.reshape(X_train.shape[0], -1)  # (52066, 1600)
X_test = X_test.reshape(X_test.shape[0], -1)     # (12616, 1600)
y_train = y_train.ravel()
y_test = y_test.ravel()


# In[25]:


from sklearn.model_selection import train_test_split
X_train_sub, X_val, y_train_sub, y_val = train_test_split(
    X_train, y_train, test_size=0.2, random_state=42
)


# In[ ]:





# In[26]:


n_epochs = 30  # Number of boosting rounds
validation_losses = []

xgb_model = XGBRegressor(objective='reg:squarederror', n_estimators=1, learning_rate=0.1)

for epoch in range(n_epochs):
    # Increase the number of boosting rounds
    xgb_model.n_estimators += 1
    xgb_model.fit(X_train_sub, y_train_sub)

    # Evaluate on the validation set
    y_val_pred = xgb_model.predict(X_val)
    val_mse = mean_squared_error(y_val, y_val_pred)
    validation_losses.append(val_mse)

    print(f"Epoch {epoch+1}/{n_epochs}, Validation MSE: {val_mse}")

# Plotting the validation losses over epochs
plt.figure(figsize=(10, 6))
plt.plot(range(1, n_epochs+1), validation_losses, marker='o', label='Validation Loss (MSE)')
plt.xlabel('Epoch')
plt.ylabel('Validation Loss (MSE)')
plt.title('Validation Loss per Epoch')
plt.legend()
plt.grid(True)
plt.show()

# Final evaluation on the test set
y_test_pred = xgb_model.predict(X_test)
test_mse = mean_squared_error(y_test, y_test_pred)
print(f"Final Test MSE: {test_mse}")


# In[ ]:





# In[33]:


import xgboost as xgb


# --- Recursive Forecasting ---
forecast_horizon = len(y_test)  # Forecast for entire test set length
X_input = X_test[0].reshape(1, -1)  # Start with first test sample

forecast = []
for _ in range(forecast_horizon):
    # Predict next step
    y_pred = xgb_model.predict((X_input))[0]
    forecast.append(y_pred)
    
    # Shift input window & add new prediction
    new_row = np.roll(X_input, shift=-1)  # Shift left
    new_row[0, -1] = y_pred  # Replace last value with predicted flux
    X_input = new_row.reshape(1, -1)  # Reshape for next prediction

# Compute RMSE
forecast_rmse = mean_squared_error(y_test, forecast, squared=False)
print(f"Forecast RMSE: {forecast_rmse:.4f}")

# --- Plot Forecast vs Actual ---
plt.figure(figsize=(12, 5))
plt.plot(y_test, label="True Flux", color='blue')
plt.plot(forecast, label="Forecasted Flux", color='red', linestyle='dashed')
plt.xlabel("Timesteps")
plt.ylabel("Flux")
plt.title("XGBoost Recursive Forecast vs True Flux")
plt.legend()
plt.show()


# In[ ]:




