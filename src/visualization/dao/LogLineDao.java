package visualization.dao;

import java.util.Date;
import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;

import visualization.dao.impl.ServerDaoImpl;
import visualization.model.AccessLogLine;
import visualization.model.InternalLogLine;
import visualization.model.LogLine;
import visualization.model.Server;


public abstract class LogLineDao {

	protected SessionFactory sessionFactory;
	
	public static int batchSize = 10;

	private ServerDao serverDao;
	
	public LogLineDao() {
		
	}

	public LogLineDao(SessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
		serverDao = new ServerDaoImpl(sessionFactory);
	}

	public void batchInsert(List<? extends LogLine> logLines) {
		Session session = sessionFactory.openSession();
		Transaction tx = null;
		try {
			tx = session.beginTransaction();
			// we add elements from the list into the DB
			int i = 0;
			while (i < logLines.size()) {
				
				LogLine logLine = logLines.get(i);
				
				if(logLine instanceof AccessLogLine) {
					String serverName = ((AccessLogLine) logLine).getServer().getName();
					Server tempServer = serverDao.getServer(serverName);
					((AccessLogLine) logLine).setServer(tempServer);
				} else if(logLine instanceof InternalLogLine){
					String serverName = ((InternalLogLine) logLine).getServer().getName();
					Server tempServer = serverDao.getServer(serverName);
					((InternalLogLine) logLine).setServer(tempServer);
				}
				
				session.merge(logLine);
				if (i % batchSize == 0) {
					session.flush();
					session.clear();
				}
				i++;
			}
			if(i<batchSize) {
				session.flush();
				session.clear();
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			tx.commit();
		}
	}

	// returns list of all log lines in DB
	public abstract List<? extends LogLine> getAllLogLines();

	// returns list of all log lines in DB after a a certain timestamp
	public abstract List<? extends LogLine> getAllLogLines(Date date);
	
	// returns list of all log lines in DB within a date range
	public abstract List<? extends LogLine> getLogLinesRange(Date start,
			Date end);
}
