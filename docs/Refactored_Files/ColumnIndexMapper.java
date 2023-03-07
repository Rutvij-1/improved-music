package com.sismics.music.core.util.dbi;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.exceptions.ResultSetException;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;

/**
 * Maps the results set to an indexed array.
 *
 * @author jtremeaux
 */
private class ColumnIndexMapper implements ResultSetMapper<Object[]> {
    /**
     * An instance of ColumnIndexMapper.
     */
    public static final ColumnIndexMapper INSTANCE = new ColumnIndexMapper();

    /**
     * Maps the result set to an indexed array.
     *
     * @param index The row number
     * @param r     The result set
     * @param ctx   The statement context
     * @return The indexed array
     */
    public Object[] map(int index, ResultSet r, StatementContext ctx) {
        ResultSetMetaData m;
        try {
            m = r.getMetaData();
        } catch (SQLException e) {
            throw new ResultSetException("Unable to obtain metadata from result set", e, ctx);
        }

        Object[] row = null;
        try {
            row = mapResultSet(r, m);
        } catch (SQLException e) {
            throw new ResultSetException("Unable to access specific metadata from " +
                    "result set metadata", e, ctx);
        }
        return row;
    }

    /**
     * Maps the result set to an indexed array.
     *
     * @param r The result set
     * @param m The result set meta data
     * @return The indexed array
     * @throws SQLException If the result set cannot be accessed
     */
    private Object[] mapResultSet(ResultSet r, ResultSetMetaData m) throws SQLException {
        Object[] row = new Object[m.getColumnCount()];
        for (int i = 1; i <= m.getColumnCount(); i++) {
            row[i - 1] = r.getObject(i);
        }
        return row;
    }
}