package visualization.chart;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;



import visualization.dao.LogLineDao;
import visualization.model.LogLine;
import visualization.util.HibernateUtil;

public abstract class Chart {
	protected DateFormat dateFormat = new SimpleDateFormat(
			"EEE MMM dd kk:mm:ss yyyy");
	protected Date prevDate;
	protected HibernateUtil hibernateUtil;
	protected LogLineDao logLineDao;
	protected List<? extends LogLine> logLines;

	public Chart() {
		hibernateUtil = new HibernateUtil();
	}

	public DateFormat getDateFormat() {
		return dateFormat;
	}
}
