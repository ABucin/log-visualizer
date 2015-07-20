package visualization.chart.impl;

import java.util.List;

import visualization.chart.Chart;
import visualization.dao.impl.InternalLogLineDaoImpl;
import visualization.util.HibernateUtil;

public class PieChart extends Chart {

	public PieChart() {
		super();
		hibernateUtil = new HibernateUtil();
		logLineDao = new InternalLogLineDaoImpl(
				hibernateUtil.getSessionFactory());
		
	}

	public String fetchMessageCount() {
		List<?> data = ((InternalLogLineDaoImpl)logLineDao).getPieChartData();
		StringBuilder buffer = new StringBuilder();
		
		for(Object o:data) {
			Object[] arr = ((Object[]) o);
			buffer.append(arr[1]+","+arr[2]+","+arr[0]+'\n');
		}

		return buffer.toString();
	}

}
