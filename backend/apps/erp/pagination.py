from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    """
    `?page=2&pageSize=25` (default 50, max 500). The response carries what a table needs to
    render its pager without a second request.
    """

    page_size_query_param = 'pageSize'
    max_page_size = 500

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page': self.page.number,
            'pageSize': self.page.paginator.per_page,
            'totalPages': self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
        })

    def get_paginated_response_schema(self, schema):
        base = super().get_paginated_response_schema(schema)
        base['properties'].update({
            'page': {'type': 'integer', 'example': 2},
            'pageSize': {'type': 'integer', 'example': 50},
            'totalPages': {'type': 'integer', 'example': 7},
        })
        return base

