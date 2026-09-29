package com.example.backend.mapper;

import com.example.backend.dto.CreateUserDTO;
import com.example.backend.dto.UpdateUserDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);

    User toEntity(UserDTO userDTO);

    User toEntityFromCreateDTO(CreateUserDTO createUserDTO);

    void updateEntityFromDTO(UpdateUserDTO updateUserDTO, @MappingTarget User user);
}

