package visualization.model;

import java.io.Serializable;
import java.text.ParseException;
import java.util.Date;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@Table(name = "internal_logs")
public class InternalLogLine extends LogLine implements Serializable {

	private static final long serialVersionUID = 1L;

	public InternalLogLine() {

	}

	public InternalLogLine(Date timestamp, LogEntrySeverity type,
			String classname, String message, Server server) {
		super();
		this.timestamp = timestamp;
		this.type = type;
		this.classname = classname;
		this.message = message;
		this.server = server;
	}

	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append(timestamp);
		builder.append(",");
		builder.append(type);
		builder.append(",");
		builder.append(classname);
		builder.append(",");
		builder.append(message);
		builder.append(",");
		builder.append(server);
		return builder.toString();
	}

	public void loadFromString(String s) {
		String[] buffer = s.split(",");
		try {
			String tempDate = buffer[0].substring(0, buffer[0].indexOf("EEST"));
			tempDate+=buffer[0].substring(buffer[0].lastIndexOf(" "));
			this.timestamp = dateFormat.parse(tempDate);
			this.type = LogEntrySeverity.valueOf(buffer[1].toUpperCase());
			this.classname = buffer[2];
			this.message = buffer[3];
			this.server = new Server(buffer[4]);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private long id;
	
	@Column(name = "timestamp")
	private Date timestamp;
	
	@Column(name = "type")
	@Enumerated(EnumType.STRING)
	private LogEntrySeverity type;
	
	@Column(name = "classname")
	private String classname;
	
	@Column(name = "message")
	private String message;
	
	@OneToOne(cascade = CascadeType.ALL)
	private Server server;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public LogEntrySeverity getType() {
		return type;
	}

	public void setType(LogEntrySeverity type) {
		this.type = type;
	}

	public String getClassname() {
		return classname;
	}

	public void setClassname(String classname) {
		this.classname = classname;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Server getServer() {
		return server;
	}

	public void setServer(Server server) {
		this.server = server;
	}

}
