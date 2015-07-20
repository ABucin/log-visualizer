package visualization.dao;

import java.util.List;


import org.hibernate.SessionFactory;

import visualization.model.InternalLogLine;

public abstract class InternalLogLineDao extends LogLineDao {

	public InternalLogLineDao() {
		
	}
	
	public InternalLogLineDao(SessionFactory sessionFactory) {
		super(sessionFactory);
	}
	
	@Override
	public abstract List<InternalLogLine> getAllLogLines();
}
