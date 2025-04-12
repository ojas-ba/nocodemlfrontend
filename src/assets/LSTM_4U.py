#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM,Dense,Dropout
import sklearn.preprocessing as sk
import sklearn.metrics
import tensorflow as tf


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


# In[ ]:





# In[7]:


plt.plot(df['mjd'],df["flux"])


# # Smoothening

# In[8]:


import statsmodels.api as sm


# In[9]:


time = df['mjd']
flux = df['flux']


# In[10]:


lowess = sm.nonparametric.lowess(flux, time, frac=0.002)
loess_time, loess_flux = zip(*lowess)
plt.plot(loess_time, loess_flux, color='orange', label='LOESS')
plt.legend()
plt.show()


# In[11]:


time = loess_time
flux = loess_flux


# In[12]:


d = pd.DataFrame({'time':time, 'flux':flux})


# In[13]:


duplicates = d[d.time.duplicated(keep=False)]
len(duplicates)


# In[14]:


d.columns


# # Calculate cumulative slope
# import numpy as np
# slope = []
# for i in range(len(d)):
#   if i == 0:
#     slope.append(np.nan)
#   else:
#     flux_diff = d['flux'][i] - d['flux'].iloc[:i].sum()
#     mjd_diff = d['time'][i] - d['time'].iloc[:i].sum()
#     slope.append(flux_diff / mjd_diff if mjd_diff !=0 else np.nan)
# d['slope'] = slope

# slope = d['slope']

# slope = slope[5:]
# d = d.iloc[5:].reset_index(drop=True)

# In[15]:


#d['expanding_sum_flux'] = d.flux.expanding().sum()


# In[16]:


#d['expanding_sum_time'] = d.time.expanding().sum()


# In[17]:


#d['cummilative_slope'] = (d.flux-d['expanding_sum_time'])/(d.time-d['expanding_sum_time'])


# In[18]:


d['rolling_mean'] = d['flux'].rolling(window=2000).mean()


# In[19]:


d['rolling_std'] = d['flux'].rolling(window=2000).std()


# In[20]:


d = d.iloc[2000:].reset_index(drop=True)


# In[21]:


d.isna().sum()


# In[ ]:





# In[23]:


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


# In[25]:


plt.plot(d['time'],d['rolling_mean'])


# In[26]:


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


# In[27]:


input_shape = 400
output_shape = 1


# In[28]:


X,y=create_sequences(d,input_shape,output_shape)


# In[29]:


X.shape


# In[30]:


X[0][0][2]=0


# In[31]:


if np.isnan(X).any():
    print("X contains NaN values.")
else:
    print("X does not contain NaN values.")


# In[32]:


nan_indices = np.argwhere(np.isnan(X))
print("Indices of NaN values in X:", nan_indices)


# In[45]:


print(X.shape,y.shape)


# In[34]:


split_index = int(0.8*len(d))
X_train,X_test = X[:split_index+1],X[split_index+1:]
y_train,y_test = y[:split_index+1],y[split_index+1:]


# In[35]:


print(y_train.shape)


# # LSTM Training

# In[47]:


from tensorflow.keras.regularizers import l1_l2

regularizer = l1_l2(l1=1e-5, l2=1e-6)  # L1 and L2 regularization

model = Sequential([
    LSTM(32, return_sequences=True,input_shape=(X.shape[1], X.shape[2]), kernel_regularizer=regularizer),
    Dropout(0.25),
    LSTM(64,return_sequences=True,kernel_regularizer=regularizer),
    Dropout(0.25),
    Dense(64, activation='relu',kernel_regularizer=regularizer),
    Dense(output_shape,kernel_regularizer=regularizer)
])

model.compile(optimizer='adam', loss='mse')


# In[48]:


from keras.callbacks import EarlyStopping
early_stopping = EarlyStopping(monitor='val_loss',patience=5,restore_best_weights=True) 


# In[49]:


tf.random.set_seed(42) #for being able to replicate the behaviour later if  


# In[50]:


history = model.fit(
    X_train,y_train,
    validation_split=0.2,
    shuffle=False,
    epochs=20,
    batch_size=64,
    verbose=1,
    callbacks=[early_stopping]
)


# # Plotting loss

# In[40]:


plt.figure(figsize=(8,4))
plt.plot(history.history['loss'],color='blue',label='Training Loss')
plt.plot(history.history['val_loss'],color='orange',label='Validation Loss')
plt.title("Training vs Validation Loss")
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.show()


# In[48]:


predictions_train = model.predict(X_train)

plt.figure(figsize=(10, 6))
plt.plot(y_train[:, 0], label='Actual Flux (scaled)')
plt.plot(predictions_train[:, 0], label='Predicted (scaled)')
plt.xlabel('Time Step')
plt.ylabel('Flux')
plt.title('Actual vs. Predicted Flux (Train - Seen Data)')
plt.legend()
plt.grid(True)
plt.show()


# In[49]:


predictions_test = model.predict(X_test)

plt.figure(figsize=(10, 6))
plt.plot(y_test[:, 0], label='Actual Flux (scaled)')
plt.plot(predictions_test[:, 0], label='Predicted (scaled)')
plt.xlabel('Time Step')
plt.ylabel('Flux')
plt.title('Actual vs. Predicted Flux (Test - Seen Data)')
plt.legend()
plt.grid(True)
plt.show()


# In[ ]:




