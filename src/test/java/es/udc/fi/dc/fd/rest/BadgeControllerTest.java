package es.udc.fi.dc.fd.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.AvatarDao;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.model.entities.Users.RoleType;
import es.udc.fi.dc.fd.model.services.exceptions.IncorrectLoginException;
import es.udc.fi.dc.fd.model.services.exceptions.LoginUserBlockedException;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class BadgeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserDao userDao;

    @Autowired
    private AvatarDao avatarDao;

    @Autowired
    private UserController userController;

    private static final String PASSWORD = "password";

    private AuthenticatedUserDto createAuthenticatedUser(String userName, RoleType roleType)
            throws LoginUserBlockedException, IncorrectLoginException {
        Optional<Avatar> avatar = avatarDao.findByName("default");
        Users user = new Users(userName, PASSWORD, "newUser", "user", userName + "@test.com", avatar.orElse(null));

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(roleType);
        user.setGender(Users.Gender.OTHER);
        user.setHeight(180);
        user.setWeight(75.0f);
        user.setBirthDate(LocalDate.now().minusYears(25));

        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName(user.getUserName());
        loginParams.setPassword(PASSWORD);

        return userController.login(loginParams);
    }

    @Test
    public void testGetEarnedBadges() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("badgeUser1", RoleType.TRAINER);
        Long userId = user.getUserDto().getId();

        mockMvc.perform(get("/api/badges/earned/" + userId)
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testGetMissingBadges() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("badgeUser2", RoleType.TRAINER);
        Long userId = user.getUserDto().getId();

        mockMvc.perform(get("/api/badges/missing/" + userId)
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    public void testCheckBadges() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("badgeUser3", RoleType.TRAINER);
        Long userId = user.getUserDto().getId();

        mockMvc.perform(post("/api/badges/check")
                .header("Authorization", "Bearer " + user.getServiceToken())
                .requestAttr("userId", userId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
    
    @Test
    public void testGetEarnedBadgesUserNotFound() throws Exception {
        AuthenticatedUserDto user = createAuthenticatedUser("badgeUser4", RoleType.TRAINER);
        
        mockMvc.perform(get("/api/badges/earned/" + 999999)
                .header("Authorization", "Bearer " + user.getServiceToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}

