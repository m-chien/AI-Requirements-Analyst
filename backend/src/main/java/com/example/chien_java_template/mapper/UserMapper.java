package com.example.chien_java_template.mapper;

import com.example.chien_java_template.dto.CreateUserDTO;
import com.example.chien_java_template.dto.UpdateUserDTO;
import com.example.chien_java_template.dto.UserDTO;
import com.example.chien_java_template.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);

    User toEntity(UserDTO userDTO);

    User toEntityFromCreateDTO(CreateUserDTO createUserDTO);

    void updateEntityFromDTO(UpdateUserDTO updateUserDTO, @MappingTarget User user);
}

