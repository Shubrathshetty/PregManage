# PregManage Mobile (Expo App)

This is the mobile application for **PregManage**, built with React Native (Expo). It connects to the same backend API as your web application.

## 🚀 How to Run Locally

1. **Install Node.js & dependencies**:
   Open a terminal in the `mobile-app/` directory and run:
   ```bash
   npm install
   ```

2. **Run Expo**:
   ```bash
   npm run start
   ```
   This will open the Expo Go developer menu. 

3. **View on your Phone**:
   - Install the **Expo Go** app from the Play Store (Android) or App Store (iOS).
   - Scan the QR code displayed in your terminal.

## ⚙️ Configuration (Backend Connection)

Since your backend is running on your machine and the mobile app is on your phone (or emulator), they need to be on the same Wi-Fi network.

1. Find your computer's **Local IP Address** (e.g., `192.168.1.10`).
2. Open `src/api/api.js`.
3. Update the `BASE_URL` with your IP:
   ```javascript
   const BASE_URL = 'http://192.168.1.XX:3000/api'; 
   ```

## 📱 Features Implemented
- **Login**: Auth via Admin/Worker credentials.
- **Dashboard**: Real-time stats and navigation.
- **Registration**: Complete patient biodata and history forms.
- **Questionnaire**: Daily screening forms.

## 📂 Project Structure
- `src/screens/`: UI screens for each feature.
- `src/api/`: Axios configuration for backend communication.
- `App.js`: Navigation logic.
