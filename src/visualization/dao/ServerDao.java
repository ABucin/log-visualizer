package visualization.dao;

import java.util.List;

import visualization.model.*;


public interface ServerDao {

	List<Server> getAllServers();

	void addOrUpdateServer(Server server);

	Server getServer(long id);
	
	Server getServer(String name);
}
