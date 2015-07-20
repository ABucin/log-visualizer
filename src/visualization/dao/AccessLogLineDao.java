package visualization.dao;

import java.util.Date;
import java.util.List;

import org.hibernate.SessionFactory;

import visualization.model.AccessLogLine;


public abstract class AccessLogLineDao extends LogLineDao {

	public AccessLogLineDao() {

	}

	public AccessLogLineDao(SessionFactory sessionFactory) {
		super(sessionFactory);
	}

	@Override
	public abstract List<AccessLogLine> getAllLogLines();

	// returns list of all log lines in DB within a date range
	@Override
	public abstract List<AccessLogLine> getLogLinesRange(Date start, Date end);

}
