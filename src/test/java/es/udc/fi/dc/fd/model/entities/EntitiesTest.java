
package es.udc.fi.dc.fd.model.entities;

import org.junit.Test;
import static org.junit.Assert.*;
import java.time.LocalDateTime;

import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import jakarta.transaction.Transactional;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class EntitiesTest {

	@Test
	public void testRoutineExerciseIdEqualsAndHashCode() {
		RoutineExerciseId id1 = new RoutineExerciseId(1L, 2L);
		RoutineExerciseId id2 = new RoutineExerciseId(1L, 2L);
		RoutineExerciseId id3 = new RoutineExerciseId(2L, 1L);
		assertEquals(id1, id2);
		assertNotEquals(id1, id3);
		assertEquals(id1.hashCode(), id2.hashCode());
		assertNotEquals(id1.hashCode(), id3.hashCode());
	}

	@Test
	public void testRoutineExerciseIdGettersSetters() {
		RoutineExerciseId id = new RoutineExerciseId();
		id.setRoutineId(10L);
		id.setExerciseId(20L);
		assertEquals(Long.valueOf(10L), id.getRoutineId());
		assertEquals(Long.valueOf(20L), id.getExerciseId());
	}

	@Test
	public void testNotificationGettersSetters() {
		Users receiver = new Users();
		Users sender = new Users();
		Routine routine = new Routine();
		String message = "Test message";
		Boolean isRead = false;
		LocalDateTime date = LocalDateTime.now();
		Notification notification = new Notification(receiver, sender, routine, message, isRead, date);
		notification.setId(100L);
		assertEquals(Long.valueOf(100L), notification.getId());
		assertEquals(receiver, notification.getReceiver());
		assertEquals(sender, notification.getSender());
		assertEquals(routine, notification.getRoutine());
		assertEquals(message, notification.getMessage());
		assertEquals(isRead, notification.getIsRead());
		assertEquals(date, notification.getDate());
	}

	@Test
	public void testNotificationDefaultConstructorAndSetters() {
		Notification notification = new Notification();
		Users receiver = new Users();
		Users sender = new Users();
		Routine routine = new Routine();
		String message = "Hello";
		Boolean isRead = true;
		LocalDateTime date = LocalDateTime.now();
		notification.setReceiver(receiver);
		notification.setSender(sender);
		notification.setRoutine(routine);
		notification.setMessage(message);
		notification.setIsRead(isRead);
		notification.setDate(date);
		notification.setId(200L);
		assertEquals(receiver, notification.getReceiver());
		assertEquals(sender, notification.getSender());
		assertEquals(routine, notification.getRoutine());
		assertEquals(message, notification.getMessage());
		assertEquals(isRead, notification.getIsRead());
		assertEquals(date, notification.getDate());
		assertEquals(Long.valueOf(200L), notification.getId());
	}
	@Test
	public void testAvatarGettersSetters() {
		Avatar avatar = new Avatar();
		avatar.setId(1L);
		avatar.setName("TestAvatar");
		avatar.setAvatarBase64("base64string");
		assertEquals(Long.valueOf(1L), avatar.getId());
		assertEquals("TestAvatar", avatar.getName());
		assertEquals("base64string", avatar.getAvatarBase64());
	}

	@Test
	public void testAvatarConstructor() {
		Avatar avatar = new Avatar("AvatarName", "imgbase64");
		assertNull(avatar.getId());
		assertEquals("AvatarName", avatar.getName());
		assertEquals("imgbase64", avatar.getAvatarBase64());
	}

	@Test
	public void testBlockUserGettersSetters() {
		BlockUser blockUser = new BlockUser();
		blockUser.setId(10L);
		blockUser.setIdBlocker(20L);
		blockUser.setIdBlocked(30L);
		LocalDateTime now = LocalDateTime.now().withNano(0);
		blockUser.setDateBlock(now);
		assertEquals(Long.valueOf(10L), blockUser.getId());
		assertEquals(Long.valueOf(20L), blockUser.getIdBlocker());
		assertEquals(Long.valueOf(30L), blockUser.getIdBlocked());
		assertEquals(now, blockUser.getDateBlock());
	}

	@Test
	public void testBlockUserConstructor() {
		BlockUser blockUser = new BlockUser(100L, 200L);
		assertNull(blockUser.getId());
		assertEquals(Long.valueOf(100L), blockUser.getIdBlocker());
		assertEquals(Long.valueOf(200L), blockUser.getIdBlocked());
		assertNotNull(blockUser.getDateBlock());
	}
}
