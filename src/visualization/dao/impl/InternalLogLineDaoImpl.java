package visualization.dao.impl;

import java.io.Serializable;
import java.util.Date;
import java.util.List;


import org.hibernate.Criteria;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Disjunction;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;

import visualization.dao.InternalLogLineDao;
import visualization.model.InternalLogLine;
import visualization.model.LogEntrySeverity;
import visualization.model.LogLine;


public class InternalLogLineDaoImpl extends InternalLogLineDao implements
		Serializable {

	private static final long serialVersionUID = 1L;

	public InternalLogLineDaoImpl() {
		super();
	}

	public InternalLogLineDaoImpl(SessionFactory sessionFactory) {
		super(sessionFactory);
	}

	private Session getSession() throws HibernateException {
		return sessionFactory.openSession();
	}

	@Override
	public List<InternalLogLine> getAllLogLines() {
		List<InternalLogLine> internalLogLineList = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(InternalLogLine.class);
		internalLogLineList = criteria.list();
		session.flush();
		session.close();
		return internalLogLineList;
	}
	
	public List<?> getPieChartData(){
		List<?> data = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(InternalLogLine.class);
		criteria.createAlias("server", "s")
		.setProjection(Projections.projectionList()
				.add(Projections.rowCount())
				.add(Projections.groupProperty("type"))
				.add(Projections.groupProperty("s.name")))
				.add(Restrictions.ne("type", LogEntrySeverity.NONE));
		data = criteria.list();
		session.flush();
		session.close();
		return data;
	}
	
	public List<?> getConveyorParallelChartData(){
		List<?> data = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(InternalLogLine.class);
		criteria.createAlias("server", "s")
		.setProjection(Projections.projectionList()
				.add(Projections.rowCount())
				.add(Projections.groupProperty("type")))
				.add(Restrictions.ne("type", LogEntrySeverity.NONE));
		data = criteria.list();
		session.flush();
		session.close();
		return data;
	}
	
	public List<?> getConveyorParallelChartData(Date date){
		List<?> data = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(InternalLogLine.class);
		criteria.createAlias("server", "s")
		.add(Restrictions.ge("timestamp", date))
		.setProjection(Projections.projectionList()
				.add(Projections.rowCount())
				.add(Projections.groupProperty("type")))
				.add(Restrictions.ne("type", LogEntrySeverity.NONE));
		data = criteria.list();
		session.flush();
		session.close();
		return data;
	}

	public List<?> getConveyorParallelChartData(Date start, Date end){
		List<?> data = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(InternalLogLine.class);
		criteria.createAlias("server", "s")
		.add(Restrictions.between("timestamp", start, end))
		.setProjection(Projections.projectionList()
				.add(Projections.rowCount())
				.add(Projections.groupProperty("type")))
				.add(Restrictions.ne("type", LogEntrySeverity.NONE));
		data = criteria.list();
		session.flush();
		session.close();
		System.out.println("returned "+data.size()+" lines");
		return data;
	}
	
	public List<InternalLogLine> getLogLinesRange(Date start, Date end, String chartFormat,
			String[] servers, String[] messageTypes, String classText,
			String messageText) {
		List<InternalLogLine> internalLogLineList = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(InternalLogLine.class);
		criteria.add(Restrictions.between("timestamp", start, end))
		.add(Restrictions.like("classname", "%"+classText+"%"))
		.add(Restrictions.like("message", "%"+messageText+"%"));
		if (messageTypes != null) {
			Disjunction codeDisjunction = Restrictions.disjunction();
			for (String s : messageTypes) {
				codeDisjunction.add(Restrictions.eq("type", LogEntrySeverity.valueOf(s)));
			}
			criteria.add(codeDisjunction);
		}
		if (servers != null) {
			Disjunction serverDisjunction = Restrictions.disjunction();
			for (String s : servers) {
				serverDisjunction.add(Restrictions.eq("name", s));
			}
			criteria.createCriteria("server").add(serverDisjunction);
		}
		internalLogLineList = criteria.list();
		session.flush();
		session.close();
		return internalLogLineList;
	}

	//get all lines after between certain dates
	@Override
	public List<InternalLogLine> getLogLinesRange(Date start, Date end) {
		List<InternalLogLine> internalLogLineList = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(InternalLogLine.class);
		criteria.add(Restrictions.ge("timestamp", start));
		criteria.add(Restrictions.le("timestamp", end));
		internalLogLineList = criteria.list();
		session.flush();
		session.close();
		return internalLogLineList;
	}

	//get all lines after a certain date
	@Override
	public List<? extends LogLine> getAllLogLines(Date date) {
		List<InternalLogLine> internalLogLineList = null;
		Session session = getSession();
		Criteria criteria = session.createCriteria(InternalLogLine.class);
		criteria.add(Restrictions.ge("timestamp", date));
		internalLogLineList = criteria.list();
		session.flush();
		session.close();
		return internalLogLineList;
	}

}
