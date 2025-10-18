package es.udc.fi.dc.fd.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;


import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;



@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserController userController;

    @Test
    public void testGetAllBackgrounds() throws Exception {
        mockMvc.perform(get("/api/images/getAllBackgrounds"))
               .andExpect(status().isOk())
               .andExpect(content().contentType(MediaType.APPLICATION_JSON))
               .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    public void testGetImageByName() throws Exception {
        String imageName = "mazao";

        mockMvc.perform(get("/api/images/getByName/{name}", imageName))
               .andExpect(status().isOk())
               .andExpect(content().contentType(MediaType.APPLICATION_JSON))
               .andExpect(jsonPath("$.name").value(imageName));
    }

    @Test
    public void testGetAllAvatars() throws Exception {
        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setUserName("user1");
        loginParams.setPassword("12345");

        AuthenticatedUserDto user = userController.login(loginParams);

        mockMvc.perform(get("/api/images/getAllAvatars")
            .header("Authorization", "Bearer " + user.getServiceToken())
               .param("page", "0")
               .param("size", "4"))
               .andExpect(status().isOk())
               .andExpect(content().contentType(MediaType.APPLICATION_JSON))
               .andExpect(jsonPath("$.items").isArray());
    }

}
