
# 🏬 System Zarządzania Hurtownią

**Gałąź:** `autentykacja_i_zarzadzanie_uzytkownikami`

Aplikacja webowa do zarządzania hurtownią z systemem autentykacji i zarządzania użytkownikami.

---

## 📦 Backend

### 🔧 Instalacja i uruchomienie

1. **Sklonuj repozytorium:**

   ```bash
   git clone https://github.com/Petter77/system-zarzadzania-hurtownia.git
   cd system-zarzadzania-hurtownia
   ```

2. **Przejdź do katalogu backendu:**

   ```bash
   cd backend
   ```

3. **Zainstaluj zależności:**

   ```bash
   npm install
   ```

4. **Utwórz plik `.env` i dodaj konfigurację:**

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/hurtownia
   JWT_SECRET=twoj_tajny_klucz
   ```

   Upewnij się, że MongoDB jest uruchomione i dostępne pod podanym adresem.

5. **Uruchom serwer:**

   ```bash
   npm run dev
   ```

   Serwer powinien być dostępny pod adresem: `http://localhost:5000`

---

## 💻 Frontend

### 🔧 Instalacja i uruchomienie

1. **Przejdź do katalogu frontendu:**

   ```bash
   cd ../frontend
   ```

2. **Zainstaluj zależności:**

   ```bash
   npm install
   ```

3. **Utwórz plik `.env` i dodaj konfigurację:**

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

   Upewnij się, że adres API odpowiada adresowi, pod którym działa backend.

4. **Uruchom aplikację:**

   ```bash
   npm start
   ```

   Aplikacja frontendowa powinna być dostępna pod adresem: `http://localhost:3000`

---

## ✅ Gotowe!

Jeśli wszystko poszło zgodnie z planem, aplikacja backendowa i frontendowa powinna działać lokalnie. Miłego korzystania! 🚀
