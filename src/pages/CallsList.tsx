import { useState } from 'react'
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { PAGINATED_CALLS } from '../gql/queries';
import {
  Grid,
  Icon,
  Typography,
  Spacer,
  Box,
  DiagonalDownOutlined,
  DiagonalUpOutlined,
  Pagination
} from '@aircall/tractor';
import { formatDate, formatDuration } from '../helpers/dates';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const PaginationWrapper = styled.div`
   > div{
    width: inherit;
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-itens: center;

  }
`;
export const CallListWrapper = styled.section`
  {
    display: flex;
    justify-content: center;
    flex-direction:column;
    height:70vh;
  }
`;

export const CardWrapper = styled.div`
  {
    display: flex;
    flex-direction:column;
    overflow: auto;
    height:100vh;
    padding: 1rem 0;
    position:relative;
    align-items:top;
  }
`;




export const CallsListPage = () => {
  const [callPerPage, setCallPerPage] = useState(25)
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const pageQueryParams = search.get('page');
  const activePage = !!pageQueryParams ? parseInt(pageQueryParams) : 1;
  const { loading, error, data } = useQuery(PAGINATED_CALLS, {
    variables: {
      offset: (activePage - 1) * callPerPage,
      limit: callPerPage
    }
    // onCompleted: () => handleRefreshToken(),
  });



  if (loading) return <p>Loading calls...</p>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  const { totalCount, nodes: calls } = data.paginatedCalls;


  const handleCallOnClick = (callId: string) => {
    navigate(`/calls/${callId}`);
  };

  const handlePageChange = (page: number) => {
    navigate(`/calls/?page=${page}`);
  };
  const handleOnPageSizeChange = (page: number) => {
    setCallPerPage(page);
  }

  return (
    <>
      <CallListWrapper>
        
        <Typography variant="displayM" textAlign="center" py={3}>
          Calls History
        </Typography>
        <CardWrapper>
        <Spacer space={3} direction="vertical">
          {calls.map((call: Call) => {
            const icon = call.direction === 'inbound' ? DiagonalDownOutlined : DiagonalUpOutlined;
            const title =
              call.call_type === 'missed'
                ? 'Missed call'
                : call.call_type === 'answered'
                  ? 'Call answered'
                  : 'Voicemail';
            const subtitle = call.direction === 'inbound' ? `from ${call.from}` : `to ${call.to}`;
            const duration = formatDuration(call.duration / 1000);
            const date = formatDate(call.created_at);
            const notes = call.notes ? `Call has ${call.notes.length} notes` : <></>;

            return (
              <Box
                key={call.id}
                bg="black-a30"
                borderRadius={16}
                cursor="pointer"
                
                onClick={() => handleCallOnClick(call.id)}
              >
                <Grid
                  gridTemplateColumns="32px 1fr max-content"
                  columnGap={2}
                  borderBottom="1px solid"
                  borderBottomColor="neutral-700"
                  alignItems="center"
                  px={4}
                  py={2}
                >
                  <Box>
                    <Icon component={icon} size={32} />
                  </Box>
                  <Box>
                    <Typography variant="body">{title}</Typography>
                    <Typography variant="body2">{subtitle}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" textAlign="right">
                      {duration}
                    </Typography>
                    <Typography variant="caption">{date}</Typography>
                  </Box>
                </Grid>
                <Box px={4} py={2}>
                  <Typography variant="caption">{notes}</Typography>
                </Box>
              </Box>
            );
          })}
        </Spacer>
        </CardWrapper>
        {totalCount && (
          <PaginationWrapper>
            <Pagination
              activePage={activePage}
              pageSize={callPerPage}
              onPageChange={handlePageChange}
              recordsTotalCount={totalCount}
              onPageSizeChange={handleOnPageSizeChange}
            />
          </PaginationWrapper>
        )}
      </CallListWrapper>
    </>
  );
};
