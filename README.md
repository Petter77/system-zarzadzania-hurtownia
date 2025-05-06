Funkcjonalność obsługiwania faktur

Aktorzy: 
-pracownik 
-manager
-audytor

1.Dodawanie Faktór do systemu
   1. Wybór użądzeń jakich ma dotyczyc faktóra 
   2. Ustalenie ilości danych użadzeń
   3. Wpisanie reszty danchy faktóry

<<<<<<< HEAD
Aplikacja webowa do zarządzania hurtownią z systemem autentykacji i zarządzania użytkownikami.

---

## 📦 Backend

### 🔧 Instalacja i uruchomienie

1. **Sklonuj repozytorium:**

   ```bash
   git clone https://github.com/Petter77/system-zarzadzania-hurtownia/blob/autentykacja_i_zarzadzanie_uzytkownikami/
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
   

4. **Uruchom serwer:**

   ```bash
   npm start
   ```

   Serwer powinien być dostępny pod adresem: `http://localhost:5137`

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


4. **Uruchom aplikację:**

   ```bash
   npm run dev
   ```

   Aplikacja frontendowa powinna być dostępna pod adresem: `http://localhost:3000`

## BAZA DANYCH

**Wstawienie rekordów do tabeli users. Skopiować to polecenie do zakładki sql w tabeli users:**
```
INSERT INTO users (id, username, password_hash, role) VALUES
(21, 'manager', '$2b$10$eed0m6vKPVTKNnP9iZ1kV.z0Xee3U.gzDerzqzYsyTTeTCaVkuzPi', 'manager'),
(25, 'pracownik1', '$2b$10$F/YE.olyutHzdvl11J3Voegt9EnaGeah3JQsfyes4niopgZxtzqLi', 'user'),
(26, 'pracownik2', '$2b$10$.8OSmenylr65IOCX9VWmreVK47n2rYtcEEaKJXBYr4wejzc79zCsC', 'user'),
(27, 'auditor', '$2b$10$CkoZ2qT.h/GkyANBFyjg5eDIKhsEJICBBFg.32ro.yHbhOy/9gS22', 'auditor');
```
Hasła są takie same jak loginy do wszystkich użytkowników
---

## ✅ Gotowe!

Jeśli wszystko poszło zgodnie z planem, aplikacja backendowa i frontendowa powinna działać lokalnie. Miłego korzystania! 🚀
=======
2.Wysiwetlanie Faktór w systemie + Eksport w formacie (?)
   1. Wyswietlanie wszystkich faktór w systemie w formie tabeli
   2. Morzliwosć wyboru eksportu dnej faktury
>>>>>>> ecd93b841f5b52a37481d0b8631a7e1c011051b1
