# Chien Java Template - Java Spring Boot Skeleton

## 📋 Mô Tả Dự Án

**Chien Java Template** là một skeleton/template hoàn chỉnh cho việc phát triển ứng dụng Java Spring Boot với cấu trúc tổ chức rõ ràng, best practices, và các thành phần cần thiết cho một ứng dụng doanh nghiệp.

## 🏗️ Cấu Trúc Dự Án

```
src/main/java/com/example/chien_java_template/
├── config/                   # Cấu hình ứng dụng
│   ├── SecurityConfig.java
│   ├── JwtAuthenticationEntryPoint.java
│   └── JwtAccessDeniedHandler.java
├── controller/              # REST Controllers
│   ├── AuthController.java
│   └── UserController.java
├── dto/                     # Data Transfer Objects
│   ├── request/
│   │   ├── UserLoginRequest.java
│   │   └── ChangePasswordRequest.java
│   ├── response/
│   │   ├── AuthResponse.java
│   │   └── PageResponse.java
│   ├── UserDTO.java
│   ├── CreateUserDTO.java
│   ├── UpdateUserDTO.java
│   └── PaginationDTO.java
├── enums/                   # Enumerations
│   ├── AuthProvider.java
│   ├── UserRole.java
│   └── SortDirection.java
├── exception/              # Exception handling
│   ├── AppException.java
│   ├── ErrorCode.java
│   ├── ApiResponse.java
│   └── GlobalExceptionHandle.java
├── mapper/                 # MapStruct Mappers
│   └── UserMapper.java
├── model/                  # JPA Entities
│   └── User.java
├── repository/             # Data Access Layer
│   └── UserRepository.java
├── service/               # Business Logic
│   ├── AuthService.java
│   ├── UserService.java
│   ├── JwtService.java
│   └── GoogleTokenVerifier.java
├── utils/                 # Utilities
│   ├── Constants.java
│   └── ValidationUtils.java
└── ChienJavaTemplateApplication.java
```

## 🛠️ Công Nghệ Sử Dụng

### Core Framework
- **Spring Boot 4.0.3** - Nền tảng ứng dụng
- **Java 21** - Ngôn ngữ lập trình
- **Spring Security** - Bảo mật
- **Spring Data JPA** - ORM

### Thư Viện Chính
- **Lombok 1.18.32** - Giảm boilerplate code
- **MapStruct 1.5.5.Final** - DTO mapping
- **JWT (Nimbus Jose) 9.31** - Token quản lý
- **Google API Client 2.4.0** - Google OAuth
- **Spring Data Redis** - Caching với Redis

### Database
- **SQL Server** - Database chính

### Build & Dependency Management
- **Maven** - Build tool
- **Maven Compiler Plugin 3.11.0** - Java compilation

## 🚀 Bắt Đầu

### Yêu Cầu
- Java 21 trở lên
- Maven 3.8.0 trở lên
- SQL Server

### Cài Đặt

1. **Clone dự án**
```bash
git clone https://github.com/yourusername/chien-java-template.git
cd chien-java-template
```

2. **Cấu hình database**
Chỉnh sửa file `src/main/resources/application.yaml`:
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=your_db
    username: your_username
    password: your_password
```

3. **Cấu hình JWT**
Thêm vào `application.yaml`:
```yaml
jwt:
  secretKey: your_secret_key_here
```

4. **Cấu hình Google OAuth**
Thêm vào `application.yaml`:
```yaml
google:
  clientId: your_google_client_id
```

5. **Cấu hình Redis (nếu sử dụng)**
```yaml
spring:
  redis:
    host: localhost
    port: 6379
```

6. **Build và chạy**
```bash
mvn clean install
mvn spring-boot:run
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/google-login` - Đăng nhập với Google
- `POST /api/v1/auth/refresh` - Làm mới token
- `POST /api/v1/auth/logout` - Đăng xuất

### Users
- `POST /api/v1/users` - Tạo user mới
- `GET /api/v1/users` - Lấy danh sách users
- `GET /api/v1/users/{id}` - Lấy user theo ID
- `GET /api/v1/users/email/{email}` - Lấy user theo email
- `PUT /api/v1/users/{id}` - Cập nhật user
- `DELETE /api/v1/users/{id}` - Xóa user
- `PUT /api/v1/users/{id}/activate` - Kích hoạt user
- `PUT /api/v1/users/{id}/deactivate` - Vô hiệu hóa user

## 🔐 Security Features

- **JWT Authentication** - Token-based authentication
- **Password Encryption** - BCrypt password hashing
- **OAuth 2.0** - Google login support
- **CORS Configuration** - Cross-origin request handling
- **Role-based Access Control** - RBAC implementation
- **Token Refresh** - Automatic token refresh mechanism

## 📝 Model Attributes

### User Model
```
- id: Long (Primary Key)
- email: String (Unique, Required)
- password: String (Hashed)
- fullName: String (Required)
- username: String (Unique)
- phoneNumber: String
- avatar: String
- role: String (USER, ADMIN, etc.)
- isActive: Boolean (default: true)
- provider: String (LOCAL, GOOGLE, FACEBOOK)
- providerId: String
- createdAt: LocalDateTime (Auto)
- updatedAt: LocalDateTime (Auto)
- lastLoginAt: LocalDateTime
```

## 🔧 Cấu Hình Chính

### PasswordEncoder
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

### JWT Configuration
- Secret Key: Để lại trong `application.yaml`
- Access Token: 15 phút
- Refresh Token: 7 ngày
- Algorithm: HS256

### CORS
- Cho phép tất cả origins (có thể cấu hình trong `SecurityConfig`)

## 📊 Database Schema

User table sẽ được tạo tự động từ User entity với các columns:
- `id` BIGINT (PK, AUTO_INCREMENT)
- `email` VARCHAR(255) (UNIQUE, NOT NULL)
- `password` VARCHAR(255) (NOT NULL)
- `full_name` VARCHAR(255) (NOT NULL)
- `username` VARCHAR(50) (UNIQUE)
- `phone_number` VARCHAR(20)
- `avatar` VARCHAR(500)
- `role` VARCHAR(50) (NOT NULL)
- `is_active` BIT (DEFAULT 1)
- `provider` VARCHAR(50)
- `provider_id` VARCHAR(255)
- `created_at` DATETIME (NOT NULL)
- `updated_at` DATETIME (NOT NULL)
- `last_login_at` DATETIME

## 🧪 Testing

Run tests với:
```bash
mvn test
```

## 📦 Dependencies Chi Tiết

| Dependency | Version | Mục Đích |
|-----------|---------|---------|
| Spring Boot | 4.0.3 | Framework |
| Spring Security | Latest | Authentication & Authorization |
| Spring Data JPA | Latest | ORM |
| Spring Data Redis | Latest | Caching |
| Lombok | 1.18.32 | Reduce boilerplate |
| MapStruct | 1.5.5.Final | DTO Mapping |
| Nimbus JOSE+JWT | 9.31 | JWT handling |
| Google API Client | 2.4.0 | OAuth |
| SQL Server JDBC | Latest | Database driver |
| Validation | Latest | Input validation |

## 🎯 Best Practices Đã Implement

✅ **Layered Architecture** - Separation of concerns  
✅ **DTO Pattern** - Data transfer objects  
✅ **Mapper Pattern** - Entity-DTO conversion  
✅ **Exception Handling** - Global exception handling  
✅ **Logging** - SLF4J logging  
✅ **Validation** - Input validation  
✅ **Security** - JWT + OAuth  
✅ **Configuration** - Externalized configuration  
✅ **Pagination** - Pagination support  
✅ **Documentation** - API documentation ready  

## 📖 Hướng Dẫn Sử Dụng

### 1. Thêm Một Feature Mới

**Bước 1:** Tạo Entity trong `model/`
```java
@Entity
public class Product {
    // fields
}
```

**Bước 2:** Tạo Repository trong `repository/`
```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

**Bước 3:** Tạo DTOs trong `dto/`
```java
public class ProductDTO { }
public class CreateProductDTO { }
```

**Bước 4:** Tạo Mapper trong `mapper/`
```java
@Mapper(componentModel = "spring")
public interface ProductMapper { }
```

**Bước 5:** Tạo Service trong `service/`
```java
@Service
public class ProductService { }
```

**Bước 6:** Tạo Controller trong `controller/`
```java
@RestController
public class ProductController { }
```

### 2. Xử Lý Lỗi

Sử dụng `AppException` với `ErrorCode`:
```java
throw new AppException(ErrorCode.USER_NOT_FOUND);
```

### 3. Validation

Sử dụng `ValidationUtils`:
```java
if (!ValidationUtils.isValidEmail(email)) {
    throw new AppException(ErrorCode.INVALID_EMAIL_FORMAT);
}
```

## 🚧 Tính Năng Có Sẵn

- ✅ User registration & authentication
- ✅ JWT token management
- ✅ Google OAuth integration
- ✅ Password hashing
- ✅ Role-based access control
- ✅ User activation/deactivation
- ✅ Last login tracking
- ✅ Global exception handling
- ✅ Pagination support
- ✅ DTO mapping

## 🔮 Tính Năng Sắp Thêm

- [ ] Email verification
- [ ] Two-factor authentication
- [ ] API rate limiting
- [ ] Audit logging
- [ ] File upload handling
- [ ] WebSocket support
- [ ] Cache management
- [ ] Elasticsearch integration

## 📧 Support

Để được hỗ trợ, vui lòng tạo issue hoặc liên hệ: [your-email@example.com]

## 📄 License

MIT License

## 👨‍💻 Tác Giả

**Chien** - Java Developer

---

**Last Updated:** February 2026  
**Version:** 1.0.0

