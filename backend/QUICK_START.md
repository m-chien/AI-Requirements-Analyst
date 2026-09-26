# 🚀 QUICK START GUIDE

## 5 PHÚT ĐỂ BẮT ĐẦU

### Step 1: Clone & Rename (1 phút)
```bash
git clone <repository> my-app
cd my-app

# Rename package
# FROM: com.example.chien_java_template
# TO: com.yourcompany.yourapp
```

### Step 2: Configure Database (2 phút)
Mở `src/main/resources/application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=my_db
    username: sa
    password: your_password
```

### Step 3: Configure JWT (1 phút)
Thêm vào `application.yaml`:

```yaml
jwt:
  secretKey: your_super_secret_key_here_min_32_chars
```

### Step 4: Build & Run (1 phút)
```bash
mvn clean install
mvn spring-boot:run
```

Server chạy tại: `http://localhost:8080`

---

## 🧪 TEST ENDPOINTS

### 1. Register User
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "fullName": "John Doe",
    "username": "johndoe",
    "phoneNumber": "0123456789"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

Response:
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

### 3. Get Users
```bash
curl -X GET http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get User by ID
```bash
curl -X GET http://localhost:8080/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Update User
```bash
curl -X PUT http://localhost:8080/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullName": "Jane Doe",
    "phoneNumber": "0987654321"
  }'
```

### 6. Delete User
```bash
curl -X DELETE http://localhost:8080/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Activate User
```bash
curl -X PUT http://localhost:8080/api/v1/users/1/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Deactivate User
```bash
curl -X PUT http://localhost:8080/api/v1/users/1/deactivate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 9. Login with Google
```bash
curl -X POST http://localhost:8080/api/v1/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "GOOGLE_ID_TOKEN"}'
```

### 10. Refresh Token
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN"
```

### 11. Logout
```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 PROJECT STRUCTURE OVERVIEW

```
src/main/java/com/example/chien_java_template/
├── config/              → Security & JWT config
├── controller/          → REST API endpoints
├── dto/                 → Data transfer objects
├── enums/               → Enumerations
├── exception/           → Exception handling
├── mapper/              → DTO ↔ Entity mapping
├── model/               → JPA entities
├── repository/          → Database access
├── service/             → Business logic
└── utils/               → Utilities & constants
```

---

## 🔑 KEY FILES TO KNOW

### Must Read
- 📄 `README.md` - Complete documentation
- 📄 `application.yaml` - Configuration
- 📄 `pom.xml` - Dependencies

### Configuration
- ⚙️ `SecurityConfig.java` - Security settings
- ⚙️ `application.yaml` - App properties

### Business Logic
- 💼 `UserService.java` - User operations
- 💼 `AuthService.java` - Authentication

### Database
- 🗄️ `User.java` - User entity
- 🗄️ `UserRepository.java` - User repository

---

## 🛠️ ADD NEW FEATURE

Contoh: Thêm Product feature

### 1. Create Entity
`model/Product.java`
```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Double price;
    // ... fields
}
```

### 2. Create Repository
`repository/ProductRepository.java`
```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

### 3. Create DTOs
`dto/ProductDTO.java`, `dto/CreateProductDTO.java`, etc.

### 4. Create Mapper
`mapper/ProductMapper.java`
```java
@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductDTO toDTO(Product product);
    Product toEntity(ProductDTO dto);
}
```

### 5. Create Service
`service/ProductService.java`
```java
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository repository;
    // CRUD methods
}
```

### 6. Create Controller
`controller/ProductController.java`
```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    // Endpoints
}
```

---

## 🐛 TROUBLESHOOTING

### Issue: Database Connection Error
**Solution:**
- Check `application.yaml` datasource settings
- Verify SQL Server is running
- Ensure database exists

### Issue: JWT Token Invalid
**Solution:**
- Check `jwt.secretKey` is set
- Verify token hasn't expired
- Use refresh endpoint

### Issue: Port 8080 Already in Use
**Solution:**
```yaml
server:
  port: 8081  # Change to different port
```

### Issue: Package Not Found
**Solution:**
```bash
mvn clean install  # Reinstall dependencies
```

---

## 📚 USEFUL COMMANDS

```bash
# Build project
mvn clean install

# Run application
mvn spring-boot:run

# Run tests
mvn test

# Package as JAR
mvn package

# Deploy JAR
java -jar target/chien-java-template-0.0.1-SNAPSHOT.jar

# Check dependencies
mvn dependency:tree

# Update dependencies
mvn versions:display-dependency-updates
```

---

## 🔐 DEFAULT SECURITY SETTINGS

| Setting | Value |
|---------|-------|
| Access Token TTL | 15 minutes |
| Refresh Token TTL | 7 days |
| Password Algorithm | BCrypt |
| Token Algorithm | HS256 |
| Auth Header | Authorization: Bearer {token} |

---

## ✅ CHECKLIST BEFORE DEPLOYMENT

- [ ] Database configured
- [ ] JWT secret key set
- [ ] Google OAuth ID configured (if using)
- [ ] Redis configured (if using)
- [ ] application.yaml reviewed
- [ ] All tests passed
- [ ] No hardcoded credentials
- [ ] Logging configured
- [ ] Error handling tested
- [ ] CORS settings appropriate

---

## 🚀 READY TO GO!

Bạn đã sẵn sàng bắt đầu phát triển. Happy coding! 💻

---

**Need Help?**
- Check `README.md` for detailed guide
- Check `PROJECT_STATUS.md` for status
- Check `REFACTORING_NOTES.md` for changes

**Last Updated:** February 27, 2026

