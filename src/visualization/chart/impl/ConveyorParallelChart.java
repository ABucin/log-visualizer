package visualization.chart.impl;

import java.util.Date;
import java.util.List;


import visualization.chart.Chart;
import visualization.dao.impl.AccessLogLineDaoImpl;
import visualization.dao.impl.InternalLogLineDaoImpl;
import visualization.model.LogLine;
import visualization.util.HibernateUtil;

public class ConveyorParallelChart extends Chart {
	
	public ConveyorParallelChart() {
		super();
		hibernateUtil = new HibernateUtil();
		logLineDao = new InternalLogLineDaoImpl(
				hibernateUtil.getSessionFactory());
	}

	public String getLogLines(long packet) {
		List<?> data = ((InternalLogLineDaoImpl)logLineDao).getConveyorParallelChartData();
		StringBuilder buffer = new StringBuilder();
		
		for(Object o:data) {
			Object[] arr = ((Object[]) o);
			buffer.append(arr[1]+","+arr[0]+","+packet+'\n');
		}

		return buffer.toString();
	}

	public String getLogLines(Date date, long packet) {
		List<?> data = ((InternalLogLineDaoImpl)logLineDao).getConveyorParallelChartData(date);
		StringBuilder buffer = new StringBuilder();
		
		for(Object o:data) {
			Object[] arr = ((Object[]) o);
			buffer.append(arr[1]+","+arr[0]+","+packet+'\n');
		}

		return buffer.toString();
	}
	
	public String getLogLines(Date start, Date end, long packet) {

		List<?> data = ((InternalLogLineDaoImpl)logLineDao).getConveyorParallelChartData(start, end);
		StringBuilder buffer = new StringBuilder();

		for(Object o:data) {
			Object[] arr = ((Object[]) o);
			buffer.append(arr[1]+","+arr[0]+","+packet+'\n');
		}

		return buffer.toString();
	}

}
