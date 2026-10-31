# Python 3.14+ compatibility patch for Django BaseContext.__copy__
try:
    from django.template.context import BaseContext
    _orig_copy = getattr(BaseContext, '__copy__', None)

    def _python_314_compat_copy(self):
        cls = self.__class__
        obj = cls.__new__(cls)
        obj.__dict__.update(self.__dict__)
        obj.dicts = self.dicts[:]
        return obj

    BaseContext.__copy__ = _python_314_compat_copy
except Exception:
    pass
