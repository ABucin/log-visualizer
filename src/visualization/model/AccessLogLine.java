package visualization.model;

import java.io.Serializable;
import java.text.ParseException;
import java.util.Date;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@Table(name = "access_logs")
public class AccessLogLine extends LogLine implements Serializable {

	private static final long serialVersionUID = 1L;

	public AccessLogLine() {

	}
	
	public AccessLogLine(String ip, Date timestamp, String url, String code,
			long size, Server server) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.url = url;
		this.code = code;
		this.size = size;
		this.server = server;
	}
	
	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append(ip);
		builder.append(",");
		builder.append(timestamp);
		builder.append(",");
		builder.append(url);
		builder.append(",");
		builder.append(code);
		builder.append(",");
		builder.append(size);
		builder.append(",");
		builder.append(server);
		return builder.toString();
	}

	public void loadFromString(String s) {
		String[] buffer = s.split(",");
		try {
			this.ip = buffer[0];
			String tempDate = buffer[1].substring(0, buffer[1].indexOf("EEST"));
			tempDate+=buffer[1].substring(buffer[1].lastIndexOf(" "));
			this.timestamp = dateFormat.parse(tempDate);
			this.url = buffer[2];
			this.code = buffer[3];
			this.size = Long.parseLong(buffer[4]);
			this.server = new Server(buffer[5]);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private long id;

	@Column(name = "ip")
	private String ip;

	@Column(name = "timestamp")
	private Date timestamp;

	@Column(name = "url")
	private String url;

	@Column(name = "code")
	private String code;

	@Column(name = "size")
	private long size;

	@OneToOne(cascade = CascadeType.ALL)
	private Server server;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public long getSize() {
		return size;
	}

	public void setSize(long size) {
		this.size = size;
	}

	public Server getServer() {
		return server;
	}

	public void setServer(Server server) {
		this.server = server;
	}

}
